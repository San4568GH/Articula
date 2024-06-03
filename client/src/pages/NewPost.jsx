
import { Navigate } from "react-router-dom"
import { useState } from "react"
import EditTools from "../EditTools"

//Code for 'Create new post' page
export default function NewPost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/post', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      alert('Post Published Successfully!');
      setRedirect(true);
    }
  }

  //   useEffect(() => {
  //     if (redirect) {
  //       window.location.reload(); // Refresh the page after redirection
  //     }
  //   }, [redirect]);

  if (redirect) {
    return <Navigate to={'/'} />;
  }


  return (

    <form onSubmit={createNewPost}>
      <input type="title"
        placeholder={"Title"}
        value={title}
        onChange={ev => setTitle(ev.target.value)} />

      <input type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={ev => setSummary(ev.target.value)} />

      <input type="file"
        //DONT use value={files},returns blank screen
        onChange={ev => setFiles(ev.target.files)} />

      <EditTools value={content} onChange={setContent} />
      <button style={{ marginTop: '5px' }}>Publish Post</button>
    </form>
  )
}