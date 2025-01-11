import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import EditTools from "../EditTools";

//Code for Edit function of Posts
export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://articula-backend.onrender.com/post/${id}`)
        if (response.ok) {
          const postInfo = await response.json();
          setTitle(postInfo.title)
          setContent(postInfo.content)
          setSummary(postInfo.summary)
        }
        else {
          console.log('Error getting Full Post:', response.statusText)
        }
      }
      catch (error) {
        console.log('Failed to Show Post:', error)
      }
    }
    fetchPost()
  }, [])


  async function updatePost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);
    if (files?.[0]) {
      data.set('file', files?.[0]);
    }

    const response = await fetch('https://articula-backend.onrender.com/post', {
      method: 'PUT',
      body: data,
      credentials: 'include'
    })
    if (response.ok) {
      alert('Post updated successfully!')
      setRedirect(true)
      const result = await response.json()
      console.log('Post updated successfully:', result)
    }
    else {
      throw new Error('Failed to update post')
    }
  }

  if (redirect) {
    return <Navigate to={'/post/' + id} />
  }

  return (
    <form onSubmit={updatePost}>
      <input type="title"
        placeholder={'Title'}
        value={title}
        onChange={ev => setTitle(ev.target.value)} />
      <input type="summary"
        placeholder={'Summary'}
        value={summary}
        onChange={ev => setSummary(ev.target.value)} />
      <input type="file"
        onChange={ev => setFiles(ev.target.files)} />
      <EditTools onChange={setContent} value={content} />
      <button style={{ marginTop: '5px' }}>Update post</button>
    </form>
  )
}