import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { FC } from "react";
import { useChatContext } from "../chat-context";
import { ChatFileUI } from "../chat-file/chat-file-ui";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = (props) => {
  const { fileState } = useChatContext();

  const { showFileUpload } = fileState;

  return (
    <div className="grid grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-2 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
        <p className="">
        Geben Sie einfach Ihre Nachricht in das unten stehende Feld ein.
        Sie können den Chat auch personalisieren, indem Sie die Einstellungen auf der rechten Seite ändern.
        </p>
      </div>
      <Card className="col-span-3 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          Personalisieren
        </Typography>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
          Wählen Sie einen Gesprächsstil
          </p>
          <ChatStyleSelector disable={false} />
        </div>
        {/*<div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
          Wie würden Sie gerne chatten?
          </p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" && <ChatFileUI />}*/}
      </Card>
    </div>
  );
};
