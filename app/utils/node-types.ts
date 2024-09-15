import { Node } from '@xyflow/react';
import { RepoDataType } from '#app/utils/enums/repoDataTypeEnum.ts';
import { NodeType } from '#app/utils/enums/nodeTypeEnum.ts';


export type SharedNodeData = {
	depth: number; // The depth starts from 0. (depth of root node is 0)
	dataObject: object;
	stringifiedJson: string;
	parentNodePathIds: string[]; // e.g. [], ['n0'], ['n0', 'n3', 'n5'], ...
};

export type DirectoryNodeData = SharedNodeData & {
	dataType: RepoDataType.Object;
	/**
	 * Will be set if parent of `ObjectNode` is an array, so nullable.
	 */
	arrayIndexForObject: number | null;
	obj: object;
	isRootNode: boolean;
};

export type ArrayNodeData = SharedNodeData & {
	dataType: RepoDataType.Array;
	array: any[];
};

export type PrimitiveNodeData = SharedNodeData & {
	dataType:
		| RepoDataType.String
		| RepoDataType.Number
		| RepoDataType.Boolean
		| RepoDataType.Null;
	/**
	 * `PrimitiveNode` is always an item of specific array.
	 * It means that the parent is always an `ArrayNode`.
	 */
	arrayIndex: number;
	value: string | number | boolean | null;
};

export type DirectoryRepoNode = Node<DirectoryNodeData, NodeType.Directory>;
export type PrimitiveRepoNode = Node<PrimitiveNodeData, NodeType.Primitive> & {
	id: string;
	position: { x: number; y: number };
};
export type ArrayRepoNode = Node<ArrayNodeData, NodeType.Array>;

export type RepoNode = DirectoryRepoNode | PrimitiveRepoNode | ArrayRepoNode;
