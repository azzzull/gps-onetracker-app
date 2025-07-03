import { useEffect, useState } from 'react';

export function useCountUp(target, duration = 1000) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        let raf;
        const startTime = performance.now();
        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            setValue(current);
            if (progress < 1) {
                raf = requestAnimationFrame(animate);
            } else {
                setValue(target);
            }
        }
        animate(performance.now());
        return () => raf && cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}
