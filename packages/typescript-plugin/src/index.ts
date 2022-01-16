import * as ts from "typescript";

export default function (program: ts.Program, pluginOptions: any) {
  return (ctx: ts.TransformationContext) => {
    console.log("Getting somewhere!!!!");
    console.log("Getting somewhere!!!!");
    console.log("Getting somewhere!!!!");
    console.log("Getting somewhere!!!!");
    console.log("Getting somewhere!!!!");
    console.log("Getting somewhere!!!!");
    return (sourceFile: ts.SourceFile) => {
      console.log("PRE VISITOR", sourceFile.text)

      function visitor(node: ts.Node): ts.Node {
        console.log("WITHIN VISITOR", node.kind, node.getChildCount())
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier) /*&&
          node.moduleSpecifier.text.includes("lodash")*/
        ) {
          console.log("found something fascinating!", node);
          /*           return ctx.factory.updateImportDeclaration(
            node,
            node.decorators,
            node.modifiers,
            node.importClause,
            ts.createStringLiteral(node.moduleSpecifier.text)
          ); */
        }

        return ts.visitEachChild(node, visitor, ctx);
      }

      return visitor(sourceFile); 
    };
  };
}
