import { useState } from "react";

export default function UserAvatar({ avatarUrl, userName, imgClassName, placeholderClassName }) {
  const [failed, setFailed] = useState(false);

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt={userName}
        className={imgClassName}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={placeholderClassName}>
      {userName?.[0]?.toUpperCase()}
    </div>
  );
}
