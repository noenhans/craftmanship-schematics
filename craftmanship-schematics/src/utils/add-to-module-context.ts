import { SourceFile } from 'typescript';

export interface AddToModuleContext {
  // source of the module file
  source: SourceFile;
  // the relative path that points from the module file to the component file
  relativePath: string;
  // name of the component class
  classifiedName: string;
}