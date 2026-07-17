import java.util.ArrayDeque;
import java.util.ArrayList;

class Solution {
    public ArrayList<Integer> maxOfSubarrays(int[] nums, int k) {
        ArrayList<Integer> res = new ArrayList<>();
        ArrayDeque<Integer> max = new ArrayDeque<>();

        for (int i = 0; i < nums.length; i++) {
         while (!max.isEmpty()&&max.peekFirst()<=i-k){
             max.pollFirst();
         }
         while (!max.isEmpty()&&nums[max.peekLast()]<=nums[i]){
             max.pollLast();
         }
         max.offerLast(i);
         if (i>=k-1){
             res.add(nums[max.peekFirst()]);
         }
        }

        return res;
    }
}