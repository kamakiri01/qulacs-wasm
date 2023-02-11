int* transpaleITYPEVecToIntArray(const std::vector<ITYPE> vec) {
    int size = vec.size();
    int arr[size];
    for (int i = 0; i < size; i++) {
        arr[i] = (int) vec[i]; // NOTE: long long intをintに丸めている。JSで (un)signed long long intを取得する方法を検討
    }
    return arr;
}
