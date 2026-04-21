//this is for postcard element in PostsPage
//peace version

//import react functions
import { Link } from "react-router-dom";

//import styles
import "../../styles/components/post-card.css";

//import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartRegular, faComment } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid, faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";


function PostCard({ post, liked = false, likeCount, onLike }) {

    //tranform database values
    const imageUrl = post.posterUrl;
    const postDate = new Date(post.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const eventDate = post.startDateTime? new Date(post.startDateTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }) : null;
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={i < rating ? faStarSolid : faStarRegular}
            />
        ));
    };

//------------------------component render
    return (
        <div className="post-card">
            <Link to={`/posts/${post.postId}`} className="post-card__link">

                {/* Poster thumbnail */}
                <div className="post-card__poster-wrap">
                    <img src={imageUrl} alt={post.title} className="post-card__poster" />
                </div>

                {/* Content */}
                <div className="post-card__content">

                    {/* Event Title */}
                    <div className="post-card__title-row">
                        <span className="post-card__title">{post.title}</span>
                        {/* {eventDate && <span className="post-card__year">{eventDate}</span>} */}
                    </div>

                    {/* Stars + Attended by*/}
                    <div className="post-card__meta-row">
                        <span className="post-card__stars">{renderStars(post.rating)}</span>
                        <span className="post-card__watched">
                            Attended by{" "}
                            <span className="post-card__username">{post.username}</span>
                        </span>
                    </div>

                    {/* post Date */}
                    <span className="post-card__date">{postDate}</span>

                    {/* Review text */}
                    <p className="post-card__text">{post.content}</p>

                    {/* like + comment count */}
                    <div className="post-card__footer">
                        <button
                            className={`btn-like${liked ? " btn-like--active" : ""}`}
                            onClick={(e) => { e.preventDefault(); onLike?.(); }}
                            aria-label={liked ? "Unlike" : "Like"}
                        >
                            <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartRegular} />
                            {(Number(likeCount ?? post.likeCount) || 0).toLocaleString()} likes
                        </button>
                        <span className="post-card__comment-count">
                            <FontAwesomeIcon icon={faComment} /> {post.commentCount}
                        </span>
                    </div>

                </div>
            </Link>
        </div>
    );
}

export default PostCard;
