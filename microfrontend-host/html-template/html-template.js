const url = process.env.URL;

const template = ({ attributes, bundle, files, publicPath, title }) => {
  const importmap = files.js.reduce((a, c) => ((a[c.name] = `${url}/${c.fileName}`), a), {});
  return `<!DOCTYPE html>
 <html>
   <head>
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <script defer src="${url}/es-module-shims.min.js"></script>
    <script type="importmap-shim">
        {
          "imports": ${JSON.stringify(importmap)}
        }
    </script>
   <script type="module-shim" src="${importmap.main}"></script>
  </head>
  <body>
    <div id="root">
        
    </div>
  </body>
</html>
`;
};

export default template;
