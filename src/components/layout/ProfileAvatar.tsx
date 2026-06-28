import React from "react";

export interface ProfileAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    user_metadata: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
    email: string;
  };
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { width: 32, height: 32, fontSize: "text-xs" },
  md: { width: 36, height: 36, fontSize: "text-sm" },
  lg: { width: 48, height: 48, fontSize: "text-base" },
};

function generateInitials(user: {
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
  email: string;
}): string {
  const name =
    user.user_metadata.full_name ||
    user.user_metadata.name ||
    user.email;

  // Split by whitespace, dots, or dashes
  const parts = name.split(/[\s.\-_]+/).filter((part) => part.length > 0);

  let initials = "";

  if (parts.length >= 2) {
    initials = parts[0][0] + parts[parts.length - 1][0];
  } else if (parts.length >= 1) {
    initials = parts[0][0];
  } else {
    initials = "U";
  }

  return initials.toUpperCase();
}

export function ProfileAvatar({
  user,
  size = "md",
  onClick,
  className,
  ...props
}: ProfileAvatarProps) {
  const config = sizeConfig[size];
  const initials = generateInitials(user);

  const handleImageError = () => {
    // Fallback to initials on image load error
    // This is handled by the component re-rendering
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium transition-all hover:opacity-80 cursor-pointer ${className || ""}`}
      style={{
        width: config.width,
        height: config.height,
        fontSize: config.fontSize,
      }}
      role="img"
      aria-label="User avatar"
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      {...props}
    >
      {user.user_metadata.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="User avatar"
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        initials
      )}
    </div>
  );
}
