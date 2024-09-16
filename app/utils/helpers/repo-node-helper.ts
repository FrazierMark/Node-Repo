import { NodeType } from '../enums/nodeTypeEnum';
import { ArrayRepoNode, DirectoryRepoNode, PrimitiveRepoNode, RepoNode } from '../node-types.ts';

export const isObjectRepoNode = (node: RepoNode): node is DirectoryRepoNode => {
  return node.type === NodeType.Directory;
};

export const isArrayRepoNode = (node: RepoNode): node is ArrayRepoNode => {
  return node.type === NodeType.Array;
};

export const isPrimitiveRepoNode = (node: RepoNode): node is PrimitiveRepoNode => {
  return node.type === NodeType.Primitive;
};
