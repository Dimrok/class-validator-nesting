import { IsArray, IsNumber, ValidateNested, validateSync } from 'class-validator';

class Item {
  @IsNumber()
  data!: number;

  constructor(data: number) {
    this.data = data;
  }
}

class Wrapper {
  @IsArray()
  @ValidateNested({ each: false })
  items!: Item[];

  constructor(...items: Item[]) {
    this.items = items;
  }
}

describe("#ValidateNested", () => {
  it('validates empty array', () => {
    const errors = validateSync(new Wrapper());
    expect(errors).toHaveLength(0);
  });

  it('validates array', () => {
    const errors = validateSync(new Wrapper(new Item(0)));
    expect(errors).toHaveLength(0);
  });

  it('validates array of 2', () => {
    const errors = validateSync(new Wrapper(new Item(0), new Item(0)));
    expect(errors).toHaveLength(0);
  });

  it('fails validation if item.data is a string', () => {
    const errors = validateSync(new Wrapper(new Item('0' as unknown as number)));
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ children: expect.arrayContaining([
        expect.objectContaining({ children: expect.arrayContaining([
          expect.objectContaining({
            "constraints": {
              "isNumber": "data must be a number conforming to the specified constraints"
            },
            "property": "data",
            "target": {
              "data": "0"
            },
            "value": "0"
          })
        ])})
      ])})
    ]));
  });

  it('fails if data is an array of array of items', () => {
    const errors = validateSync(new Wrapper([new Item(0)] as unknown as Item));
    expect(errors).toHaveLength(1)
  });

  it('fails if data is an array of array of array of items', () => {
    const errors = validateSync(new Wrapper([[new Item(0)]] as unknown as Item));
    expect(errors).toHaveLength(1)
  });


  it('fails if data is an array of array of items and item is malformed', () => {
    const errors = validateSync(new Wrapper([new Item('0' as unknown as number)] as unknown as Item));
    expect(errors).toHaveLength(1)
  });
})
