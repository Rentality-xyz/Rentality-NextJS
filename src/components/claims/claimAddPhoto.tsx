import React, {useRef, useState} from 'react';
import Image from "next/image";

function ClaimAddPhoto() {
    const MAX_ADD_IMAGE = 5
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleImageClick = () => {
        inputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setImageUrl(imageUrl);
                handlePhotoAdd(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const [photos, setPhotos] = useState<string[]>([]);

    const handlePhotoAdd = (imageUrl: string) => {
        setPhotos([...photos, imageUrl]);
    };

    const renderedPhotos = [];
    for (let i = 0; i < photos.length + 1; i++) {
        const imageUrl = photos[i];
        if (photos.length < MAX_ADD_IMAGE) {
            renderedPhotos.push(
                <div key={i} className="w-72 h-60 rounded-2xl overflow-hidden mr-4 cursor-pointer bg-gray-200 bg-opacity-40 bg-center bg-no-repeat bg-[url('../images/add_circle_outline_white_48dp.svg')]">
                    {imageUrl ? (
                        <Image
                            className="w-full h-full object-cover"
                            width={1000}
                            height={1000}
                            src={imageUrl}
                            alt=""
                            onClick={handleImageClick}
                        />
                    ) : (
                        <div className="w-full h-full" onClick={handleImageClick} />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={inputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                </div>
            );
        } else {
            let imgMargin = ""
            if (i == 0) {
                imgMargin = ""
            } else  {
                imgMargin = "ml-5"
            }
            if (i < MAX_ADD_IMAGE) {
                renderedPhotos.push(
                    <div key={i} className={`${imgMargin} w-72 h-60 rounded-2xl overflow-hidden cursor-pointer bg-gray-200 bg-opacity-40 bg-center bg-no-repeat bg-[url('../images/add_circle_outline_white_48dp.svg')]`}>
                        <Image
                            className="w-full h-full object-cover"
                            width={1000}
                            height={1000}
                            src={imageUrl}
                            alt=""
                            onClick={handleImageClick}
                        />
                    </div>
                );
            }
        }
    }

    return (
        <div className="flex">
            {renderedPhotos}
        </div>
    );
}

export default ClaimAddPhoto;