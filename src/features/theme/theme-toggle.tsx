"use client";

import { Laptop2, Moon, Sun, Waves, TreePine, SunDim, Sofa, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Tabs
      defaultValue={theme}
      className="flex flex-col rounded-full overflow-hidden"
    >
      <TabsList className="flex flex-col items-stretch justify-stretch flex-1">
        <TabsTrigger
          value="light"
          onClick={() => setTheme("light")}
          className="h-[40px] w-[40px] rounded-full"
        >
          <Sun size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          onClick={() => setTheme("dark")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <Moon size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="softblue"
          onClick={() => setTheme("softblue")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <Waves size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="gentlegreen"
          onClick={() => setTheme("gentlegreen")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <TreePine size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="warmorange"
          onClick={() => setTheme("warmorange")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <SunDim size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="calmpurple"
          onClick={() => setTheme("calmpurple")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <Sofa size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="refreshingteal"
          onClick={() => setTheme("refreshingteal")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <Sparkles size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="system"
          onClick={() => setTheme("system")}
          className="h-[40px] w-[40px]  rounded-full"
        >
          <Laptop2 size={18} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
