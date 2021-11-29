declare module 'xcode' {
  interface xcode {
    project(projPath: string): any;
  }

  const xcode: xcode;
  export default xcode;
}
