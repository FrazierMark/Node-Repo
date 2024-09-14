import { Editor } from '@monaco-editor/react';
import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';

const handleStyle = { left: 10 };

const CodeEditorNode = () => {
	const [value, setValue] = useState(`
  convertToExcalidrawElements([
    {
      type: "rectangle",
      x: 50,
      y: 250,
      width: 200,
      height: 100,
      backgroundColor: "#c0eb75",
      strokeWidth: 2,
    },
    {
      type: "ellipse",
      x: 300,
      y: 250,
      width: 200,
      height: 100,
      backgroundColor: "#ffc9c9",
      strokeStyle: "dotted",
      fillStyle: "solid",
      strokeWidth: 2,
    },
    {
      type: "diamond",
      x: 550,
      y: 250,
      width: 200,
      height: 100,
      backgroundColor: "#a5d8ff",
      strokeColor: "#1971c2",
      strokeStyle: "dashed",
      fillStyle: "cross-hatch",
      strokeWidth: 2,
    },
  ]);
  `);

	return (
		<div className='z-5 hover:scale-101 hover:z-100'>
			<Handle type='target' position={Position.Top} />
			<div className='code-editor-container'>
				<Editor
					height='50vh'
					width='60vw'
					theme='vs-dark'
					defaultLanguage='javascript'
					defaultValue={value}
					onChange={(value) => setValue(value)}
				/>
			</div>
			<Handle type='source' position={Position.Bottom} id='a' />
			<Handle
				type='source'
				position={Position.Bottom}
				id='b'
				style={handleStyle}
			/>
		</div>
	);
};

export default CodeEditorNode;
