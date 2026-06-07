"use client"

import Link from "next/link";
import SpeakText from "./components/SpeakText";
import { useState } from "react";
import SpeechTextarea from "./components/SpeechTextArea";

export default function Home() {
  const [value, setValue] = useState("");

  return (
    <>
      Hello world!

      <SpeakText text="If you want to map a standard Markdown tag (like an <h1> or <a>) to a custom React component or add custom TypeScript-supported styling, use the components prop:"></SpeakText>

      <SpeechTextarea
        value={value}
        onChange={setValue}
        rows={5}
        cols={50}
        placeholder="Type your answer here..."
      />

      <br></br>

      <Link href="/interview">Go to interview?</Link>

    </>
  );
}

