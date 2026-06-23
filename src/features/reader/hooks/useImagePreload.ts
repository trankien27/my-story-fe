import { useCallback, useRef } from "react";

export function useImagePreload() {
  const requestedUrls = useRef(new Set<string>());
  const pendingImages = useRef(new Map<string, HTMLImageElement>());

  const preloadImages = useCallback((urls: Array<string | undefined>) => {
    urls.forEach((url) => {
      if (!url || requestedUrls.current.has(url)) return;

      requestedUrls.current.add(url);
      const image = new Image();
      pendingImages.current.set(url, image);
      image.decoding = "async";
      image.onload = image.onerror = () => {
        pendingImages.current.delete(url);
      };
      image.src = url;
    });
  }, []);

  return { preloadImages };
}
