/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | string;
  export default content;
}
