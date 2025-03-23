import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import s from "./styles.module.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProductImageSlider = ({ options, thumbnail, onImageSelect, selectedImageOnDetail, images }) => {

    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [selectedImage, setSelectedImage] = useState(thumbnail.url);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const mainSwiperRef = useRef(null);
    const optionImages = options
        .flatMap(option => option.values)
        .map(value => value.image)
        .filter(image => image);
    const combinedImages = [thumbnail, ...optionImages, ...images].filter(Boolean);


    useEffect(() => {
        if (selectedImageOnDetail) {
            setSelectedImage(selectedImageOnDetail.url);
            const newIndex = combinedImages.findIndex(img => img.url === selectedImageOnDetail.url);
            if (newIndex !== -1 && mainSwiperRef.current) {
                mainSwiperRef.current.slideToLoop(newIndex);
                setSelectedIndex(newIndex);
            }
        }
    }, [selectedImageOnDetail, combinedImages]);




    const handleThumbClick = (img, index) => {
        setSelectedImage(img.url);
        setSelectedIndex(index);
        onImageSelect(img);
        mainSwiperRef.current.slideTo(index)
    };

    return (
        <div className={s.sliderContainer}>
            <Swiper
                onSwiper={(swiper) => swiper && (mainSwiperRef.current = swiper)}
                spaceBetween={10}
                navigation={true}
                modules={[Navigation, Thumbs]}
                thumbs={{ swiper: thumbsSwiper }}
                loop
                className={s.mainSwiper}
                pagination={{ clickable: true }}
                onSlideChange={(swiper) => {
                    setSelectedIndex(swiper.realIndex);
                    setSelectedImage(combinedImages[swiper.realIndex]?.url || thumbnail.url);
                    onImageSelect?.(combinedImages[swiper.realIndex] || thumbnail);
                }}
            >
                {combinedImages?.map((img, index) => (
                    <SwiperSlide key={`main-${index || img.public_id}`}>
                        <img
                            src={img.url}
                            alt={`${img.public_id}`}
                            className={s.mainImage}
                            onClick={() => {
                                setIsOpen(true)
                            }}
                        />

                    </SwiperSlide>
                ))}
            </Swiper>
            <Swiper
                onSwiper={(swiper) => swiper && setThumbsSwiper(swiper)}
                spaceBetween={10}
                slidesPerView={combinedImages?.length + 1 || 1}
                watchSlidesProgress={true}
                modules={[Navigation, Thumbs]}
                className={s.thumbSwiper}
            >
                {combinedImages?.map((img, index) => (
                    <SwiperSlide key={`sub-${index || img.public_id}`}>
                        <img
                            src={img.url}
                            alt={`${img.public_id}`}
                            className={`${s.thumbnail} ${selectedImage === img ? s.active : ""}`}
                            onClick={() => handleThumbClick(img, index)}

                        />
                    </SwiperSlide>
                ))}
            </Swiper>
            {isOpen && (
                <Lightbox
                    open={isOpen}
                    close={() => setIsOpen(false)}
                    slides={[thumbnail, ...combinedImages].map((img) => ({ src: img.url }))}
                    index={selectedIndex} // Hiển thị ảnh đang được chọn trong Lightbox
                />
            )}
        </div>
    );
};

export default ProductImageSlider;
