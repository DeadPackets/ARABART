# Compare model render with the real DOSBox screenshot (nearest-neighbour downscale to 640x480).
import sys
from PIL import Image
shot = Image.open(sys.argv[1]).convert('RGB').resize((640, 480), Image.NEAREST)
model = Image.open(sys.argv[2]).convert('RGB')
lit = lambda p: sum(p) > 120
a = [lit(p) for p in shot.getdata()]; b = [lit(p) for p in model.getdata()]
both = sum(x and y for x, y in zip(a, b)); only_s = sum(x and not y for x, y in zip(a, b)); only_m = sum(y and not x for x, y in zip(a, b))
print(f'lit pixels: screenshot={sum(a)} model={sum(b)} overlap={both} ({100*both/max(1,sum(a)):.1f}% of screenshot)')
side = Image.new('RGB', (1280, 480)); side.paste(shot, (0, 0)); side.paste(model, (640, 0)); side.save(sys.argv[3])
