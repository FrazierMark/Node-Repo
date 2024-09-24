import { Resizable } from 're-resizable';

const CodeEditorPanel = () => {

  return (
    <Resizable
      style={{
        overflow: 'hidden',
        display: isCodeEditorPanelVisible ? 'initial' : 'none',
      }}
      defaultSize={{
        width: 320,
        height: '100%',
      }}
      minWidth={272}
      maxWidth={typeof window !== 'undefined' ? window.innerWidth / 2 : undefined}
      enable={{
        right: true,
      }}
    >
    </Resizable>
  );
};

export default CodeEditorPanel
