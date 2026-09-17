// Allows plain CSS files to be imported as side effects (e.g. `import "@/app/globals.css"`)
// and CSS Modules to be imported as typed objects (e.g. `import styles from "*.module.css"`)
declare module "*.css" {
  const styles: { readonly [className: string]: string };
  export default styles;
}
