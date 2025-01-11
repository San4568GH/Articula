import { useEffect, useState } from "react"
import Post from "../Post"
export default function HomePage() {
    const [posts, setPosts] = useState([]);
    //^^empty array
    //-----------------------------------------------------------------------------------
    // useEffect(() => {
    //     fetch('https://articula-backend.vercel.app/post').then(response => {
    //       response.json().then(posts => {
    //         setPosts(posts);
    //       });
    //     });
    //   }, []);
    //^^using then and catch
    //-----------------------------------------------------------------------------------
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch('https://articula-backend.vercel.app/post')
                if (response.ok) {
                    const posts = await response.json()
                    setPosts(posts)
                }
                else {
                    console.error('Failed to show Post:', response.statusText)
                }

            }
            catch (error) {
                console.error('Error getting Post:', error)

            }
        }
        fetchPost()
    }, [])

    return (
        <>
            {posts.length > 0 && posts.map(post => (
                <Post {...post} />
                //Spreads all the key-value pairs of 'post' object as props to the Post.jsx file
            ))}
        </>

    )
}