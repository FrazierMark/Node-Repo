import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { DirectoryRepoNode } from '#app/utils/node-types';

const DirectoryNode = memo(({ id, data, isConnectable }: NodeProps<DirectoryRepoNode>) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div>
        <ul>
          <li>id: {id}</li>
          <li>value: {data.value}</li>
          
        </ul>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={isConnectable}
      />
    </>
  );
});

export default DirectoryNode;
