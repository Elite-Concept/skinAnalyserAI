

interface ImagePreviewProps {
  imageUrl: string;
}

export default function ImagePreview({ imageUrl }: ImagePreviewProps) {
  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Analyzed skin"
        className="w-full h-64 object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
    </div>
  );
}