import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function helloWorld(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    debugger;
    _context.logger.info('I was here...');
    tree.create('hello-world.txt', 'Hello Craftmanship!');
    return tree;
  };
}
