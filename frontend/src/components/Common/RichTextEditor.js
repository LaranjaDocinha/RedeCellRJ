import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <CKEditor
      config={{
        placeholder: placeholder,
        toolbar: [
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          'bulletedList',
          'numberedList',
          'blockQuote',
          '|',
          'undo',
          'redo',
        ],
      }}
      data={value}
      editor={ClassicEditor}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default RichTextEditor;
