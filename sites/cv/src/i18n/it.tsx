import { en } from './en';

type RranslationRecord = Record<keyof typeof en, string>;

export const it: RranslationRecord = {
  desctipion: `
    Sono sempre stato un appassionato di tecnologia e di informatica, ho
    iniziato a programmare a 14 anni e da allora non ho mai smesso. Ho
    studiato ingegneria informatica all'Università di Trento, dove ho
    conseguito la laurea triennale. Durante gli studi ho lavorato come
    sviluppatore web e mobile per un'azienda di Trento.
`,
  ftechDescription: `
    Mi è stata offerta la possibilità di entrare in società in F.technology
    con l'obbiettivo di fare nascere e crescere un nuovo team di sviluppo
    all'interno dell'azienda. L'obbiettivo strategico era quelli
  `,
  r3gisDescription: ``,
  caffeinaDescription: ``,
  motorialabDescription: ``,
  openMoveDescription: ``,
};
