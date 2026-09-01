import { toDisplayPhoto } from "@/lib/classroom/photos";
import { cn } from "@/lib/utils";

type AvatarUser = {
  Name?: string;
  name?: string;
  Photo?: string;
};

export function UserAvatar({
  user,
  size = "md",
}: {
  user: AvatarUser;
  size?: "sm" | "md" | "lg";
}) {
  const name = user.Name || user.name || "U";
  const src = toDisplayPhoto(user.Photo);
  const dim =
    size === "lg" ? "size-20 text-2xl" : size === "sm" ? "size-9 text-sm" : "size-11 text-base";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("rounded-full object-cover bg-blush", dim)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-blush font-bold text-rose-deep",
        dim,
      )}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}
