import { InsertChange } from '@schematics/angular/utility/change';
import { Rule, Tree, SchematicsException } from "@angular-devkit/schematics";
import { ModuleOptions, buildRelativePath } from '@schematics/angular/utility/find-module';
import { AddToModuleContext } from "./add-to-module-context";
import { createSourceFile, ScriptTarget } from "typescript";
import { dasherize, classify } from "@angular-devkit/core/src/utils/strings";
import { addDeclarationToModule } from "@schematics/angular/utility/ast-utils";

export function addDeclarationToNgModule(options: ModuleOptions): Rule {
  return (tree: Tree) => {
    if (options.module) {
      addDeclaration(tree, options);
    }

    return tree;
  };
}

function createAddToModuleContext(tree: Tree, options: ModuleOptions): AddToModuleContext {
  if (!options.module) {
    throw new SchematicsException(`Module not found.`);
  }

  const moduleContent = tree.read(options.module);

  if (!moduleContent) {
    throw new SchematicsException(`File ${options.module} does not exist.`);
  }

  const moduleText = moduleContent.toString('utf-8');
  const source = createSourceFile(options.module, moduleText, ScriptTarget.Latest, true);
  const componentPath = `/${options.path}/${dasherize(options.name)}/${dasherize(options.name)}.component`;
  const relativePath = buildRelativePath(options.module, componentPath);
  const classifiedName = `${classify(options.name)}Component`;

  return { source, relativePath, classifiedName };

}

function addDeclaration(tree: Tree, options: ModuleOptions): void {
  const context = createAddToModuleContext(tree, options);
  const modulePath = options.module || '';

  const declarationChanges = addDeclarationToModule(
    context.source,
    modulePath,
    context.classifiedName,
    context.relativePath
  );

  const declarationRecorder = tree.beginUpdate(modulePath);

  declarationChanges.forEach(change => {
    if (change instanceof InsertChange) {
      declarationRecorder.insertLeft(change.pos, change.toAdd);
    }
  });

  tree.commitUpdate(declarationRecorder);
}
