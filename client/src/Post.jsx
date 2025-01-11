import { formatISO9075 } from "date-fns"
import { Link } from "react-router-dom"

//Code to make the Structure of a Postpage on HomePage
export default function Post({ _id, title, summary, cover, content, author, createdAt }) {
    return (
        <section className="article">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img src={'https://articula-backend.vercel.app/' + cover} />
                    {/* ^^as the image is in backend */}
                </Link>

            </div>
            <div className="text">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    {author && <a className="author">{author.username}</a>}

                    <time>{formatISO9075(new Date(createdAt))}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </section>
    )
}
//HAVE to use {author&&} ,else blank screen
