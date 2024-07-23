/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
 
let indexToCompare = 0;

var twoSum = function (nums, target) {
    for (let i = 1; i < nums.length; i++) {
        if (indexToCompare == i) continue;
        if ((nums[indexToCompare] + nums[i]) == target) {
            return [0, i]
        }
        if (i == nums.length) {
            indexToCompare += 1;
            twoSum(nums, target);
            console.log(indexToCompare);
            return indexToCompare;
        }
    }
};