package lab1;
import java.util.ArrayList;


public class ArraysFractions {
    protected ArrayList<Fraction> arrays;

    public ArraysFractions(){
        arrays = new ArrayList<>();
    }
    public ArraysFractions(int size){
        arrays = new ArrayList<>(size);
    }
    public ArraysFractions(Fraction... a){
        arrays = new ArrayList<>();
        for(int i = 0; i < a.length; i++) {
            arrays.add(a[i]);
        }
    }
    public void add(Fraction a){
        arrays.add(a);
    }
    public void remove(int index){
        if(index < arrays.size()) {
            arrays.remove(index);
        }
    }
    public Fraction get(int index){
        if(index < arrays.size()){
            return arrays.get(index);
        }
        return null;
    }
    public void set(int index, Fraction b){
        if(index < arrays.size()){
            arrays.set(index, b);
        }
    }
    public boolean contains(Fraction a){
        for(int i = 0; i < arrays.size(); i++){
            if(arrays.get(i).equals(a)){
                return true;
            }
        }
        return false;
    }

}