package lab1;

public class Fraction {
    private int n,d;
    public Fraction(){

    }
    
    
    /** 
     * Create a new Fraction with specified numeration and denomimator
     * @param n
     * @param d
     * @return 
     */
    public Fraction(int n, int d){
        if (d == 0) {
            throw new IllegalArgumentException("Can't be divided by zero");
        }else{
             this.n = n;
             this.d = d;
        }
    }

    private static int gcd(int a, int b){
        if(a < 0){
            a *= -1;
        }
        if(b < 0){
            b *= -1;
        }
        return b == 0 ? a : gcd(b, a % b);
    }

    private static Fraction reduce(Fraction a){
        int temp = gcd(a.n, a.d);
        a.n /= temp;
        a.d /= temp;
        return a;
    }
    public static Fraction divide(Fraction a, Fraction b){
        int rezN = a.n * b.d;
        int rezD = a.d * b.n;
        Fraction c = reduce(new Fraction(rezN,rezD));
        return c;
    }
    public static Fraction add(Fraction a, Fraction b){
        int rezN = a.n * b.d + b.n * a.d;
        int rezD = a.d * b.d;
        Fraction c = reduce(new Fraction(rezN, rezD));
        return c;
    }
    public static Fraction multiply(Fraction a, Fraction b){
        int rezN = a.n * b.n;
        int rezD = a.d * b.d;
        Fraction c = reduce(new Fraction(rezN,rezD));
        return c;
    }
    
    @Override
    public String toString() {
        return String.format("%d/%d",this.n,this.d);
    }
    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (obj == null || obj.getClass() != this.getClass()) {
            return false;
        }
    
        Fraction temp = (Fraction) obj;
        if(this.n ==  temp.n && this.d == temp.d){
            return true;
        }else{
            return false;
        }
    }
}
