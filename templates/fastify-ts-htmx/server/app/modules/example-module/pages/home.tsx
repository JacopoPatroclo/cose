import { HtmlPage } from '@templates';

export function Home(opts: { examples: { email: string }[] }) {
  console.log(opts);
  return <HtmlPage title="Home"></HtmlPage>;
}
