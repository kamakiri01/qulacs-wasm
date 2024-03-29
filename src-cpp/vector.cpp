// @see https://github.com/emscripten-core/emscripten/issues/11070#issuecomment-717675128
// std::vectorをJSで受ける際に自動的にArray変換するようカスタムマーシャリングする
namespace emscripten {
    namespace internal {
        template <typename T, typename Allocator> struct BindingType<std::vector<T, Allocator>> {
            using ValBinding = BindingType<val>;
            using WireType = ValBinding::WireType;

            static WireType toWireType(const std::vector<T, Allocator> &vec) {
                std::vector<val> valVec (vec.begin (), vec.end ());
                    return BindingType<val>::toWireType (val::array (valVec));
            }

            static std::vector<T, Allocator> fromWireType(WireType value) {
                return vecFromJSArray<T>(ValBinding::fromWireType(value));
            }
        };

        template <typename T> struct TypeID<T,
            typename std::enable_if_t<std::is_same<
                typename Canonicalized<T>::type,
                std::vector<typename Canonicalized<T>::type::value_type,
                            typename Canonicalized<T>::type::allocator_type>>::value>> {
            static constexpr TYPEID get() { return TypeID<val>::get(); }
        };

    }
}
