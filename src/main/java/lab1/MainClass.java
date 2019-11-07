package lab1;
public class MainClass{
    public static void main(String[] args){
        Fraction a = new Fraction(1,2);
        Fraction b = new Fraction(1,2);
        System.out.println(Fraction.add(a, b).toString());  
    }
    public static int max(int a, int b){
    if(a > b)
        return a;
    else
        return b;
    }
        
}