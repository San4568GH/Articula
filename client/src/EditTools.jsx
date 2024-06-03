import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'

//Code for implementing Editor for writing or editing posts Using ReactQuill
export default function EditTools({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image'],
      ['clean'],
    ],
  };
  return (
    <div className="content">
      <ReactQuill
        value={value}
        theme={'snow'}
        onChange={onChange}
        modules={modules} />
    </div>
  );
}