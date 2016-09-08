library Lib{
    function findAddress(address a, address[] storage arry) returns (int){
        for (uint i = 0 ; i < arry.length ; i++){
            if(arry[i] == a){return int(i);}
        }
        return -1;
    }
    function removeAddress(uint i, address[] storage arry){
        uint lastIndex = arry.length - 1;
        arry[i] = arry[lastIndex];
        delete arry[lastIndex];
        arry.length = lastIndex;
    }
}
