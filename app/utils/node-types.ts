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
	arrayIndexForObject: number | null;
	obj: {
		path: string;
		url: string;
	};
	isRootNode: boolean;
};


export type RepoNodeData = {
	dataObject: {
		mode: string;
		path: string;
		sha: string;
		size: number;
		type: string;
		url: string;
	};
};

export type PrimitiveNodeData = SharedNodeData & {
	dataType:
		| RepoDataType.String
		| RepoDataType.Number
		| RepoDataType.Boolean
		| RepoDataType.Null,
} & RepoNodeData;

export type DirectoryRepoNode = Node<DirectoryNodeData, NodeType.Directory>;
export type PrimitiveRepoNode = Node<PrimitiveNodeData, NodeType.Primitive> & {
	id: string;
	position: { x: number; y: number };
};

export type RepoNode = DirectoryRepoNode | PrimitiveRepoNode ;
