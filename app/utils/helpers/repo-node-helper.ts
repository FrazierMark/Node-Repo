import { NodeType } from '../enums/nodeTypeEnum';
import { ArrayRepoNode, ObjectRepoNode, PrimitiveRepoNode, RepoNode } from '../node-types.ts';

export const isObjectRepoNode = (node: RepoNode): node is ObjectRepoNode => {
  return node.type === NodeType.Object;
};

export const isArrayRepoNode = (node: RepoNode): node is ArrayRepoNode => {
  return node.type === NodeType.Array;
};

export const isPrimitiveRepoNode = (node: RepoNode): node is PrimitiveRepoNode => {
  return node.type === NodeType.Primitive;
};
