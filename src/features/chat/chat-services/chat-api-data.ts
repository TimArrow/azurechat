import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { LangChainStream, StreamingTextResponse } from "ai";
import { loadQAMapReduceChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { AzureCogSearch } from "../../langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import { insertPromptAndResponse } from "./chat-service";
import { initAndGuardChatSession } from "./chat-thread-service";
import { FaqDocumentIndex, PromptGPTProps } from "./models";
import { transformConversationStyleToTemperature } from "./utils";

export const ChatAPIData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const chatModel = new ChatOpenAI({
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  const relevantDocuments = await findRelevantDocuments(
    lastHumanMessage.content,
    id
  );

  const chain = loadQAMapReduceChain(chatModel, {
    combinePrompt: defineSystemPrompt(),
  });

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion: string) => {
      await insertPromptAndResponse(id, lastHumanMessage.content, completion);
    },
  });

  const userId = await userHashedId();

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  chain.call(
    {
      input_documents: relevantDocuments,
      question: lastHumanMessage.content,
      memory: memory,
    },
    [handlers]
  );

  return new StreamingTextResponse(stream);
};

const findRelevantDocuments = async (query: string, chatThreadId: string) => {
  const vectorStore = initVectorStore();

  const relevantDocuments = await vectorStore.similaritySearch(query, 10, {
    vectorFields: vectorStore.config.vectorFieldName,
    filter: `user eq '${await userHashedId()}' and chatThreadId eq '${chatThreadId}'`,
  });

  return relevantDocuments;
};

const defineSystemPrompt = () => {
  const system_combine_template = `When you're presented with a context and a subsequent question, start by thoroughly reading the provided context to 
  fully grasp the background information related to the question. If you are unsure, ask for more detailed information. Once you've understood the context, evaluate it. 
  If you find that the context hasn't been provided or is empty, it's important to politely inform the person asking the question that without the necessary context, you're unable to provide an answer. 
  Similarly, if the context is given but you're unfamiliar with the topic or unsure about the answer, it's crucial to decline to answer the question politely. 
  Remember, it's always better to maintain your integrity and not provide any information that might be incorrect or misleading. 
  When you're confident in your knowledge and the context is clear, go ahead and craft a concise and accurate answer based on the information you've been given. 
  However, if you ever find yourself in doubt, avoid the temptation to speculate or make up an answer. 
  It's always preferable to admit when you don't have the knowledge rather than offering potentially incorrect information. 
  If you need to decline answering, consider saying something like, "I'm sorry, but based on the provided context, I cannot provide an accurate answer," or "I'm unfamiliar with this topic and would not want to provide incorrect information.
  ----------------
  context: {summaries}`;

  const combine_messages = [
    SystemMessagePromptTemplate.fromTemplate(system_combine_template),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const CHAT_COMBINE_PROMPT =
    ChatPromptTemplate.fromPromptMessages(combine_messages);

  return CHAT_COMBINE_PROMPT;
};

const initVectorStore = () => {
  const embedding = new OpenAIEmbeddings();
  const azureSearch = new AzureCogSearch<FaqDocumentIndex>(embedding, {
    name: process.env.AZURE_SEARCH_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    apiKey: process.env.AZURE_SEARCH_API_KEY,
    apiVersion: process.env.AZURE_SEARCH_API_VERSION,
    vectorFieldName: "embedding",
  });

  return azureSearch;
};
