const allImage = import.meta.glob('$lib/assets/**/*.png', {
    eager: true,
    query: { enhanced: true }
});


export const globalBasePath = '/src/lib/assets/';

export function getImagePath(relativePath: string) {
    const key = globalBasePath + relativePath + '.png'
    const module = allImage[key] as { default: "" };
    return module ? module.default : ''
}