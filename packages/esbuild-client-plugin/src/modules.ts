// styling preprocessor import
declare module '*.styl' {
  const str: string;
  export default str;
}
declare module '*.less' {
  const str: string;
  export default str;
}
declare module '*.sass' {
  const str: string;
  export default str;
}
declare module '*.scss' {
  const str: string;
  export default str;
}
declare module '*.css' {
  const str: string;
  export default str;
}

// css modules preprocessor import
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
