export function numberToFrenchWords(num: number): string {
    if (num === 0) return "zéro";
    
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
    
    function convertBelowOneThousand(n: number): string {
        if (n === 0) return "";
        let res = "";
        
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        
        if (hundred > 0) {
            if (hundred === 1) res += "cent ";
            else res += units[hundred] + " cent " + (remainder === 0 ? "s " : "");
        }
        
        if (remainder > 0) {
            if (remainder < 10) res += units[remainder];
            else if (remainder < 20) res += teens[remainder - 10];
            else {
                const ten = Math.floor(remainder / 10);
                const unit = remainder % 10;
                
                if (ten === 7 || ten === 9) {
                    res += tens[ten - 1] + "-" + teens[unit];
                } else {
                    res += tens[ten];
                    if (unit === 1) res += " et un";
                    else if (unit > 1) res += "-" + units[unit];
                }
            }
        }
        return res.trim();
    }

    let result = "";
    
    const billions = Math.floor(num / 1000000000);
    let rem = num % 1000000000;
    
    const millions = Math.floor(rem / 1000000);
    rem %= 1000000;
    
    const thousands = Math.floor(rem / 1000);
    rem %= 1000;
    
    if (billions > 0) {
        result += convertBelowOneThousand(billions) + " milliard" + (billions > 1 ? "s " : " ");
    }
    
    if (millions > 0) {
        result += convertBelowOneThousand(millions) + " million" + (millions > 1 ? "s " : " ");
    }
    
    if (thousands > 0) {
        if (thousands === 1) result += "mille ";
        else result += convertBelowOneThousand(thousands) + " mille ";
    }
    
    if (rem > 0) {
        result += convertBelowOneThousand(rem);
    }
    
    return result.trim();
}
