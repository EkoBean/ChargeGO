const mainBall = document.querySelector(".ball.main");
        const followerBall = document.querySelector(".ball.follower");
        const items = document.querySelectorAll(".menu-item");
        const logoImg = document.querySelector(".logo img");

        // Logo hover animation
        logoImg.addEventListener("mouseenter", () => {
            logoImg.classList.add("animate__animated", "animate__rubberBand");
        });

        logoImg.addEventListener("animationend", () => {
            logoImg.classList.remove("animate__animated", "animate__rubberBand");
        });

        items.forEach(item => {
            item.addEventListener("mouseenter", () => {
                const rect = item.getBoundingClientRect();
                const navRect = item.parentElement.getBoundingClientRect();
                const x = rect.left - navRect.left + rect.width / 2 - 25;
                const y = rect.top - navRect.top + rect.height / 2 - 25;

                mainBall.style.left = x + "px";
                mainBall.style.top = y + "px";

                mainBall.classList.add("show");
                followerBall.classList.add("show");

                // 跟隨球縮小 → 移動 → 回彈
                followerBall.style.transform = "scale(0.7)";
                setTimeout(() => {
                    followerBall.style.left = x + "px";
                    followerBall.style.top = y + "px";
                    followerBall.style.transform = "scale(1)";
                }, 80);
            });

            item.addEventListener("mouseleave", () => {
                mainBall.classList.remove("show");
                followerBall.classList.remove("show");
            }, 300);
        });