import Link from "next/link";
import SpeakText from "./components/SpeakText";

export default function Home() {
  return (
    <>
      Hello world!

      <SpeakText text="If you want to map a standard Markdown tag (like an <h1> or <a>) to a custom React component or add custom TypeScript-supported styling, use the components prop:"></SpeakText>

      <br></br>

      <Link href="/interview">Go to interview?</Link>

    </>
  );
}

