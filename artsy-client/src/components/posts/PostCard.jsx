//this is for postcard element in PostsPage

//import react functions
import { Link } from "react-router-dom";

//import styles
import "../../styles/components/post-card.css";

//import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";


function PostCard({ post }) {   
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

    //to icon presentation (rating)
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={i < rating ? faStarSolid : faStarRegular}
            />
        ));
    };

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

                    {/* Stars + watched by*/}
                    <div className="post-card__meta-row">
                        <span className="post-card__stars">{renderStars(post.rating)}</span>
                        <span className="post-card__watched">
                            Watched by{" "}
                            <span className="post-card__username">{post.username}</span>
                        </span>
                    </div>

                    {/* post Date */}
                    <span className="post-card__date">{postDate}</span>

                    {/* Review text */}
                    <p className="post-card__text">{post.content}</p>

                    {/* like + comment count */}
                    <div className="post-card__footer">
                        <span className="post-card__like-count">
                            <FontAwesomeIcon icon={faHeart} />
                            {post.likeCount?.toLocaleString()} likes
                        </span>
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
