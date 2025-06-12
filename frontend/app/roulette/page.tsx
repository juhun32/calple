import RouletteCards from "@/components/roulette/RouletteCards";
import RouletteSocial from "@/components/roulette/RouletteSocial";

export default function Roulette() {
    return (
        <div className="container h-full px-8 pt-12 pb-8 mx-auto grid grid-cols-[2fr_1fr] gap-4">
            <div className="border-r border-dashed h-full">
                <RouletteCards />
            </div>
            <RouletteSocial />
        </div>
    );
}
