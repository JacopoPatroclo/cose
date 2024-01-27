import { PropsWithChildren } from '@kitajs/html';
import { HtmlPage } from '@templates';

export function Home(opts: PropsWithChildren) {
  return (
    <HtmlPage title="Home">
      <div class="h-screen flex text-center">
        <div class="m-auto gap-4 flex flex-col">
          <img
            alt="Immagine"
            draggable="true"
            src="https://pbs.twimg.com/profile_images/1746881563638595584/lglinG0Z_400x400.jpg"
            class="css-9pa8cd"
          />
          <h1 class="text-6xl ">All good!!</h1>
          <p class="text-xl">
            You are ready to develop fullstack apps with fastify and HTMX
          </p>
          <p class="text-xl">
            You need to delete this file and create your own pages.
          </p>
          {opts.children}
        </div>
      </div>
    </HtmlPage>
  );
}
