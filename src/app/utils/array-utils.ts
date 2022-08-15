export default class ArrayUtils {
    static findAndRemoveElement(array: string[], searchValue: string) {
        if (array == null || searchValue == null)
            return null;

        array.forEach((item, index) => {
            if (item === searchValue) {
                array.splice(index, 1);
                return array;
            }
        })

        return array;
    }

    static findElementIndex(array: string[], searchValue: string) {
        var indexToReturn = -1;
        
        array.forEach((item, index) => {
            if (item == searchValue) {
                indexToReturn = index;
            }
        })
        
        console.log("findElementIndex: ", indexToReturn)
        return indexToReturn;
    }
}